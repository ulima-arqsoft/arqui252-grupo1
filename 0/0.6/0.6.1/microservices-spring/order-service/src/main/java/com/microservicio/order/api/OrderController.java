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
  private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(OrderController.class);
  private final UserClient userClient;
  private final ProductClient productClient;

  public OrderController(UserClient userClient, ProductClient productClient) {
    this.userClient = userClient;
    this.productClient = productClient;
  }

  @PostMapping
  public ResponseEntity<OrderDto> create(@RequestBody Map<String, Integer> body) {
    User user = userClient.getById(body.get("userId"));
    Product product = productClient.getById(body.get("productId"));
    
    String status = determineOrderStatus(user, product);
    OrderDto order = new OrderDto(
        System.currentTimeMillis(),
        user,
        product,
        product.price(),
        status
    );
    
    return ResponseEntity.status(isSuccessful(status) ? 201 : 200).body(order);
  }

  private String determineOrderStatus(User user, Product product) {
    boolean isUserFallback = user.name().contains("FALLBACK");
    boolean isProductFallback = product.name().contains("FALLBACK");

    if (isUserFallback && isProductFallback) {
        log.warn("Both services are unavailable");
        return "FALLBACK_ALL_SERVICES_DOWN";
    } else if (isUserFallback) {
        log.warn("User service is unavailable");
        return "FALLBACK_USER_SERVICE_DOWN";
    } else if (isProductFallback) {
        log.warn("Product service is unavailable");
        return "FALLBACK_PRODUCT_SERVICE_DOWN";
    }
    return "CREATED";
  }

  private boolean isSuccessful(String status) {
    return status.equals("CREATED");
  }
}
