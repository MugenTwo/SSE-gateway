package com.mugentwo.ssegateway.config;

import lombok.Builder;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Data
@Component
@ConfigurationProperties(prefix = "sse-gateway")
public class SseGatewayProperties {

    @Builder
    public record SseEndpointConfig(
            String name,
            String url,
            Set<String> filterParams
    ) {
    }

    private List<SseEndpointConfig> endpoints;
    private List<SseEndpointConfig> securedEndpoints;
    private boolean debug = false;
    private boolean security = false;

}