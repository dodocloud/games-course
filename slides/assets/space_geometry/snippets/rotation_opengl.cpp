glPushMatrix();
glTranslatef(250,250,0.0);    // 3. Translate to the object's position.
glRotatef(angle,0.0,0.0,1.0); // 2. Rotate the object.
glTranslatef(-250,-250,0.0);  // 1. Translate to the origin.
glPopMatrix();