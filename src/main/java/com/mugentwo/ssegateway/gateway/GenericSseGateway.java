package com.mugentwo.ssegateway.gateway;

import com.mugentwo.ssegateway.config.SseGatewayProperties;
import com.mugentwo.ssegateway.contract.GenericSseEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class GenericSseGateway {

    private final WebClient.Builder webClientBuilder;

    public Flux<GenericSseEvent> streamEvents(SseGatewayProperties.SseEndpointConfig config, Map<String, String> filterParams, boolean debug) {
        String url = buildUrlWithParams(config.url(), filterParams, config.filterParams());

        return webClientBuilder.build()
                .get()
                .uri(url)
                .retrieve()
                .bodyToFlux(new ParameterizedTypeReference<Object>() {
                })
                .map(data -> GenericSseEvent.builder()
                        .sourceEndpoint(debug ? config.name() : null)
                        .data(data)
                        .timestamp(System.currentTimeMillis())
                        .build())
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(2))
                        .maxBackoff(Duration.ofSeconds(10)))
                .doOnError(error -> log.error("Error streaming from {}: {}", config.name(), error.getMessage()))
                .onErrorResume(error -> {
                    log.warn("Failed to stream from {}, returning empty stream", config.name());
                    return Flux.empty();
                });
    }

    private String buildUrlWithParams(String baseUrl, Map<String, String> filterParams, java.util.Set<String> allowedParams) {
        if (filterParams == null || filterParams.isEmpty() || allowedParams == null || allowedParams.isEmpty()) {
            return baseUrl;
        }

        StringBuilder urlBuilder = new StringBuilder(baseUrl);
        boolean hasParams = baseUrl.contains("?");

        for (Map.Entry<String, String> entry : filterParams.entrySet()) {
            if (allowedParams.contains(entry.getKey()) && entry.getValue() != null) {
                urlBuilder.append(hasParams ? "&" : "?");
                urlBuilder.append(entry.getKey()).append("=").append(entry.getValue());
                hasParams = true;
            }
        }

        return urlBuilder.toString();
    }

}