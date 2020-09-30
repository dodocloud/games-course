move_paddle
        ;read input from joystick
        lda  joystick2;joy port 2
        and  #8 ;right
        beq move_paddle_right
        lda  joystick2
        and  #4 ;#left
        beq move_paddle_left
        rts
check_ball_paddle_collision
        lda sprite_collision
        and #2
        cmp #2
        beq ball_paddle_collision
        rts
ball_paddle_collision
        ...