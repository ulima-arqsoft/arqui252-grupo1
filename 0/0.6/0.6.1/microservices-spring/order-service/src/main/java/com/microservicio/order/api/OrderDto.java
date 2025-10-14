package com.microservicio.order.api;

import com.microservicio.order.clients.Product;
import com.microservicio.order.clients.User;

public record OrderDto(long id, User user, Product product, double total, String status) {}
