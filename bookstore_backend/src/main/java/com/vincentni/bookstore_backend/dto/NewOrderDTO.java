package com.vincentni.bookstore_backend.dto;
import lombok.*;

import java.util.List;

@Getter
@Setter
public class NewOrderDTO {
    @Getter
    @Setter
    public static class OrderItem{
        Integer bookId;
        Integer bookNumber;

        public Integer getBookId() {
            return bookId;
        }

        public Integer getBookNumber() {
            return bookNumber;
        }
    }
    private List<OrderItem> orderItemList;

    public List<OrderItem> getOrderItemList() {
        return orderItemList;
    }

    public void setOrderItemList(List<OrderItem> orderItemList) {
        this.orderItemList = orderItemList;
    }
}
