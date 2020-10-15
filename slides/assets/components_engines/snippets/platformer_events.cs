// RocketComponent
void OnTriggerEnter2D (Collider2D col) {
    // If it hits an enemy...
    if(col.tag == "Enemy") {
        // ... find the Enemy script and call the Hurt function.
        col.gameObject.GetComponent<Enemy>().Hurt();
        // Call the explosion instantiation.
        OnExplode();
        // Destroy the rocket.
        Destroy (gameObject);
    }
    // Otherwise if it hits a bomb crate...
    else if(col.tag == "BombPickup") {
        // ... find the Bomb script and call the Explode function.
        col.gameObject.GetComponent<Bomb>().Explode();
 
        // Destroy the bomb crate.
        Destroy (col.transform.root.gameObject);
 
        // Destroy the rocket.
        Destroy (gameObject);
    }
}