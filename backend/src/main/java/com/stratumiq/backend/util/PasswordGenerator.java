package com.stratumiq.backend.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.io.Console;
import java.nio.CharBuffer;
import java.util.Arrays;

public class PasswordGenerator {

    public static void main(String[] args) {
        Console console = System.console();
        if (console == null) {
            throw new IllegalStateException("Run this utility from an interactive console.");
        }

        char[] password = console.readPassword("Password: ");
        if (password == null || password.length == 0) {
            throw new IllegalArgumentException("Password must not be empty.");
        }

        try {
            String hash = new BCryptPasswordEncoder(12).encode(CharBuffer.wrap(password));
            System.out.println("BCRYPT: " + hash);
        } finally {
            Arrays.fill(password, '\0');
        }
    }
}