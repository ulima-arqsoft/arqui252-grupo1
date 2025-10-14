package com.microservicio.order.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
    name = "productClient",
    url = "${clients.product.url}",
    fallback = ProductClientFallback.class,
    configuration = FeignClientConfig.class
)
public interface ProductClient {
  @GetMapping("/products/{id}")
  Product getById(@PathVariable Integer id);
}
