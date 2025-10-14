package com.microservicio.user_service;
import org.springframework.web.bind.annotation.*;
import java.util.*;

record User(Integer id, String name) {}

@RestController
@RequestMapping("/users")
public class UserController {
  private static final Map<Integer, User> DB = Map.of(
      1, new User(1, "Ana"),
      2, new User(2, "Luis")
  );

  @GetMapping("/{id}")
  public User byId(@PathVariable Integer id) {
    var u = DB.get(id);
    if (u == null) throw new NoSuchElementException("User not found");
    return u;
  }
}
