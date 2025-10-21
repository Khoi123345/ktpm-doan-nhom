package com.vincentni.bookstore_backend.dto;

import lombok.Getter;

@Getter
public class NewUserDTO {
    String username;
    String password;
    String email;
    String Id_name;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getId_name() {
        return Id_name;
    }

    public void setId_name(String id_name) {
        Id_name = id_name;
    }
}
