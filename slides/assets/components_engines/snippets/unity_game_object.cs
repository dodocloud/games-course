public sealed class GameObject : Object {
  public static extern GameObject CreatePrimitive(PrimitiveType type);
  public unsafe T GetComponent<T>();
  public T[] GetComponents<T>();

  public extern Transform transform { get; }
  public extern void SetActive(bool value);
  public extern string tag { get; set; }
  public static extern GameObject FindGameObjectWithTag(string tag);

  public void SendMessage(string methodName, object value);
  public void BroadcastMessage(string methodName, object parameter);

  public Scene scene {get;}

  public Component rigidbody {get;}
  public Component rigidbody2D {get;}
  public Component camera {get;}
  public Component light {get;}
  public Component animation {get;}
  public Component renderer {get;}
  public Component audio {get;}

  public void PlayAnimation(Object animation);
  public void StopAnimation();
}