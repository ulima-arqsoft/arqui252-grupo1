package com.microservicio.order.api;

import com.microservicio.order.clients.Product;
import com.microservicio.order.clients.ProductClient;
import com.microservicio.order.clients.User;
import com.microservicio.order.clients.UserClient;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/orders")
public class OrderController {
  private final UserClient userClient;
  private final ProductClient productClient;

  public OrderController(UserClient userClient, ProductClient productClient) {
    this.userClient = userClient;
    this.productClient = productClient;
  }

  @PostMapping
  @Retry(name = "default")
  @CircuitBreaker(name = "default", fallbackMethod = "fallback")
  public ResponseEntity<OrderDto> create(@RequestBody Map<String, Integer> body) {
    User user = userClient.getById(body.get("userId"));
    Product product = productClient.getById(body.get("productId"));
    OrderDto order = new OrderDto(System.currentTimeMillis(), user, product, product.price(), "CREATED");
    return ResponseEntity.status(201).body(order);
  }

  public ResponseEntity<OrderDto> fallback(Map<String, Integer> body, Throwable t) {
    return ResponseEntity.status(503).build();
  }
}
