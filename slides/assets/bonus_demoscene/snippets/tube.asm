PAL2    mov al,0
        out dx,al
        jns PAL3
        sub al,cl
        shr al,1
        out dx,al
        shr al,1
        out dx,al
PAL3    mov bx,cx
        mov [fs:bx],bl
        loop    PAL1
 
TEX     mov bx,cx
        add ax,cx
        rol ax,cl
        mov dh,al
        sar dh,5
        adc dl,dh
        adc dl,[fs:bx+255]
