using Dodo.Primitives;

namespace quiz_management_system.Domain.Common;



public abstract class Entity
{
    public Uuid Id { get; protected set; }

    protected Entity()
    {
        Id = Uuid.CreateVersion7();
    }

    protected Entity(Uuid id)
    {

        Id = (id == Uuid.Empty) ? Uuid.CreateVersion7() : id;
    }


}


