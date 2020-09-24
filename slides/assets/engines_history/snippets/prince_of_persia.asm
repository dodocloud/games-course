:underctrl
lda CharSword
cmp #2 ;in fighting mode?
beq FightCtrl ;yes
 
lda CharID
cmp #2 ;kid or shadowman?
bcc :cont
jmp GuardCtrl ;no
 
* What is he doing now?
:cont ldx CharPosn ;previous frame #