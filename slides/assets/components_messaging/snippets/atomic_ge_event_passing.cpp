void Object::SendEvent(StringHash eventType, VariantMap& eventData) {
    SharedPtr<EventReceiverGroup> group(context->GetEventReceivers(this, eventType));
    if (group) {
        group->BeginSendEvent();
 
        for (unsigned i = 0; i < group->receivers_.Size(); ++i) {
            Object* receiver = group->receivers_[i];
            // Holes may exist if receivers removed during send
            if (!receiver) continue;
 
            receiver->OnEvent(this, eventType, eventData);
 
            // If self has been destroyed as a result of event handling, exit
            if (self.Expired()) {
                group->EndSendEvent();
                context->EndSendEvent();
                return;
            }
            processed.Insert(receiver);
        }
        group->EndSendEvent();
    }
}