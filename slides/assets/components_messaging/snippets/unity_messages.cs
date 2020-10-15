public interface ICustomMessageTarget : IEventSystemHandler
{
    // functions that can be called via the messaging system
    void Message1();
    void Message2();
}
 
public class CustomMessageTarget : MonoBehaviour, ICustomMessageTarget
{
    public void Message1()
    {
        // handle message
    }
 
    public void Message2()
    {
        // handle message
    }
}
 
// sending message 
ExecuteEvents.Execute<ICustomMessageTarget>(target, null, (x,y) => x.Message1());