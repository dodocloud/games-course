IEnumerator Spawn () {
        // Create a random wait time before the prop is instantiated.
        float waitTime = Random.Range(minTimeBetweenSpawns, maxTimeBetweenSpawns);
        // Wait for the designated period.
        yield return new WaitForSeconds(waitTime);
 
        // Instantiate the prop at the desired position.
        Rigidbody2D propInstance = Instantiate(backgroundProp, spawnPos, Quaternion.identity) as Rigidbody2D;
        // Restart the coroutine to spawn another prop.
        StartCoroutine(Spawn());
}