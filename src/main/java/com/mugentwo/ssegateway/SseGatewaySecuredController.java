package com.mugentwo.ssegateway;

import com.mugentwo.ssegateway.contract.EventStreamRequest;
import com.mugentwo.ssegateway.contract.GenericSseEvent;
import com.mugentwo.ssegateway.service.SseGatewayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(SseGatewayConstants.EVENTS_ENDPOINT)
@ConditionalOnProperty(name = "sse-gateway.security", havingValue = "true")
public class SseGatewaySecuredController {

    private final SseGatewayService sseGatewayService;

    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<GenericSseEvent> streamEvents(@RequestParam(required = false) Set<String> sources,
                                              @RequestParam Map<String, String> allParams,
                                              @AuthenticationPrincipal Jwt jwt) {

        allParams.remove("sources");

        String userId = jwt.getSubject();
        log.debug("Extracted userId from JWT: {}", userId);

        Map<String, String> filterParams = new HashMap<>(allParams);
        filterParams.put("userId", userId);

        EventStreamRequest request = EventStreamRequest.builder()
                .sourceEndpoints(sources)
                .filterParams(filterParams)
                .secured(true)
                .build();

        return sseGatewayService.streamSecuredEvents(request);
    }

}