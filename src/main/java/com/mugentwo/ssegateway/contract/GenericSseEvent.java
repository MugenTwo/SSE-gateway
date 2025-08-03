package com.mugentwo.ssegateway.contract;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

@Builder
public record GenericSseEvent(
        @JsonInclude(JsonInclude.Include.NON_NULL)
        String sourceEndpoint,
        Object data,
        long timestamp
) {
}