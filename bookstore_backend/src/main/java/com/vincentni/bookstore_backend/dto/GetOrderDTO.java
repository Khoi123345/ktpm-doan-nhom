package com.vincentni.bookstore_backend.dto;
import com.vincentni.bookstore_backend.entity.Order;
import com.vincentni.bookstore_backend.entity.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.util.LinkedList;
import java.util.List;

@Getter
@Setter
public class GetOrderDTO {
    @Getter
    @Setter
    @AllArgsConstructor
    public static class OrderItems{
        Integer bookId;
        String bookName;
        Integer price;
        Integer bookNumber;

    }

    private Timestamp time;
    private Integer userId;
    private String username;
    private List<GetOrderDTO.OrderItems> orderItemList;
    public GetOrderDTO(Order order){
        this.userId=order.getUser().getUserId();
        this.username=order.getUser().getUsername();
        this.time=order.getTime();
        orderItemList=new LinkedList<>();
        for(OrderItem orderItem:order.getOrderItem()){
            orderItemList.add(new GetOrderDTO.OrderItems(orderItem.getBook().getBookId(),orderItem.getBook().getBookName(),orderItem.getPrice(),orderItem.getBookNumber()));
        }
    }

    public Timestamp getTime() {
        return time;
    }

    public void setTime(Timestamp time) {
        this.time = time;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public List<OrderItems> getOrderItemList() {
        return orderItemList;
    }

    public void setOrderItemList(List<OrderItems> orderItemList) {
        this.orderItemList = orderItemList;
    }
}
