package com.aiplatform.careerprep.controller;

import com.aiplatform.careerprep.dto.LoginRequest;
import com.aiplatform.careerprep.dto.SignupRequest;
import com.aiplatform.careerprep.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class TestController {

    private final UserService userService;

    @PostMapping("/signup")
    public String signup(@RequestBody SignupRequest request) {

        return userService.signup(request);
    }
    @GetMapping("/profile")
    public String profile() {
        return "Protected Profile Data";
    }
    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {

        return userService.login(request);
    }
}