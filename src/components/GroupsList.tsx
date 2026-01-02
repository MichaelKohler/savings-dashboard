import { useState } from "react";
import type { Group } from "~/models/groups.server";
import Button from "~/components/button";

interface GroupsListProps {
  groups: Group[];
}

export default function GroupsList({ groups }: GroupsListProps) {
  const [markedForDeletion, setMarkedForDeletion] = useState<
    Record<string, boolean>
  >({});

  const markForDeletion = (id: string) => () => {
    setMarkedForDeletion((prev) => ({ ...prev, [id]: true }));
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/groups/${id}/delete`, {
        method: "POST",
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to delete group", error);
    }
  };

  return (
    <main>
      <a href="/groups/new">
        <Button>+ New Group</Button>
      </a>

      <table className="mt-5 min-w-full">
        <thead className="border-b border-gray-300 text-left">
          <tr>
            <th className="pr-2">Name</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr className="border-b border-gray-300" key={group.id}>
              <td className="pr-2">{group.name}</td>
              <td className="text-right">
                <a href={`/groups/${group.id}/edit`} className="inline-block">
                  <Button>Edit</Button>
                </a>
                {!markedForDeletion[group.id] && (
                  <span className="ml-4">
                    <Button isDanger onClick={markForDeletion(group.id)}>
                      X
                    </Button>
                  </span>
                )}
                {markedForDeletion[group.id] && (
                  <span className="ml-4">
                    <Button isDanger onClick={() => handleDelete(group.id)}>
                      X?
                    </Button>
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
