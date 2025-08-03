package com.mugentwo.ssegateway.service;

import com.mugentwo.ssegateway.config.SseGatewayProperties;
import com.mugentwo.ssegateway.contract.EventStreamRequest;
import com.mugentwo.ssegateway.contract.GenericSseEvent;
import com.mugentwo.ssegateway.gateway.GenericSseGateway;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SseGatewayService {

    private final GenericSseGateway genericSseGateway;
    private final SseGatewayProperties properties;

    public Flux<GenericSseEvent> streamEvents(EventStreamRequest request) {
        log.info("Streaming events for request: {}", request);
        log.debug("Using regular endpoints (security={})", properties.isSecurity());

        List<Flux<GenericSseEvent>> streams = properties.getEndpoints().stream()
                .filter(endpoint -> shouldIncludeEndpoint(endpoint, request))
                .map(endpoint -> genericSseGateway.streamEvents(endpoint, request.filterParams(), properties.isDebug()))
                .toList();

        return Flux.merge(streams);
    }

    public Flux<GenericSseEvent> streamSecuredEvents(EventStreamRequest request) {
        log.info("Streaming secured events for request: {}", request);

        if (!properties.isSecurity()) {
            log.warn("Security not enabled, no secured endpoints available");
            return Flux.empty();
        }

        if (properties.getSecuredEndpoints() == null || properties.getSecuredEndpoints().isEmpty()) {
            log.warn("No secured endpoints configured");
            return Flux.empty();
        }

        List<Flux<GenericSseEvent>> streams = properties.getSecuredEndpoints().stream()
                .filter(endpoint -> shouldIncludeEndpoint(endpoint, request))
                .map(endpoint -> genericSseGateway.streamEvents(endpoint, request.filterParams(), properties.isDebug()))
                .toList();

        return Flux.merge(streams);
    }

    private boolean shouldIncludeEndpoint(SseGatewayProperties.SseEndpointConfig endpoint, EventStreamRequest request) {
        return request.sourceEndpoints() == null ||
                request.sourceEndpoints().isEmpty() ||
                request.sourceEndpoints().contains(endpoint.name());
    }

}