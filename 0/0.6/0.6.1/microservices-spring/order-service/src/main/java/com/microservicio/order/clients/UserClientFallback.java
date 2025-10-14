package com.microservicio.order.clients;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class UserClientFallback implements UserClient {
    private static final Logger log = LoggerFactory.getLogger(UserClientFallback.class);

    @Override
    public User getById(Integer id) {
        log.warn("Fallback executed for user id: {}", id);
        return new User(id, "[FALLBACK] User Temporarily Unavailable");
    }
}