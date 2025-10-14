package com.microservicio.order.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
    name = "userClient", 
    url = "${clients.user.url}",
    fallback = UserClientFallback.class,
    configuration = FeignClientConfig.class
)
public interface UserClient {
    @GetMapping("/users/{id}")
    User getById(@PathVariable Integer id);
}
