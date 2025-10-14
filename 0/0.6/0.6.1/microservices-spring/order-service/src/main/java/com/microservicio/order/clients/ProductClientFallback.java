package com.microservicio.order.clients;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class ProductClientFallback implements ProductClient {
    private static final Logger log = LoggerFactory.getLogger(ProductClientFallback.class);

    @Override
    public Product getById(Integer id) {
        log.warn("Fallback executed for product id: {}", id);
        return new Product(id, "[FALLBACK] Product Temporarily Unavailable", 0.0);
    }
}