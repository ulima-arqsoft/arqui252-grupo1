package com.microservicio.product_service;
import org.springframework.web.bind.annotation.*;
import java.util.*;

record Product(Integer id, String name, double price) {}

@RestController
@RequestMapping("/products")
public class ProductController {
  private static final Map<Integer, Product> DB = Map.of(
      10, new Product(10, "Laptop", 2500.0),
      11, new Product(11, "Mouse", 80.0)
  );

  @GetMapping("/{id}")
  public Product byId(@PathVariable Integer id) {
    var p = DB.get(id);
    if (p == null) throw new NoSuchElementException("Product not found");
    return p;
  }
}
