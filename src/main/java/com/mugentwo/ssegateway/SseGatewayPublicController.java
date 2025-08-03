package com.mugentwo.ssegateway;

import com.mugentwo.ssegateway.contract.EventStreamRequest;
import com.mugentwo.ssegateway.contract.GenericSseEvent;
import com.mugentwo.ssegateway.service.SseGatewayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.util.Map;
import java.util.Set;

@RestController
@RequiredArgsConstructor
@RequestMapping(SseGatewayConstants.SSE_GATEWAY_PUBLIC_ENDPOINT)
public class SseGatewayPublicController {

    private final SseGatewayService sseGatewayService;

    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<GenericSseEvent> streamEvents(@RequestParam(required = false) Set<String> sources,
                                              @RequestParam Map<String, String> allParams) {
        allParams.remove("sources");

        EventStreamRequest request = EventStreamRequest.builder()
                .sourceEndpoints(sources)
                .filterParams(allParams)
                .build();

        return sseGatewayService.streamEvents(request);
    }

}