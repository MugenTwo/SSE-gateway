package com.mugentwo.ssegateway.error;

import lombok.Getter;

@Getter
public class SseGatewayException extends RuntimeException {
    
    private final SseGatewayErrorCode errorCode;
    
    public SseGatewayException(SseGatewayErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
    
    public SseGatewayException(SseGatewayErrorCode errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
}