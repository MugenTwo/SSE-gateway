package com.mugentwo.ssegateway.contract;

import lombok.Builder;

import java.util.Map;
import java.util.Set;

@Builder
public record EventStreamRequest(
        Set<String> sourceEndpoints,
        Map<String, String> filterParams,
        boolean secured
) {

    public static EventStreamRequestBuilder builder() {
        return new EventStreamRequestBuilder().secured(false);
    }

}