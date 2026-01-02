import { useState } from "react";
import { actions } from "astro:actions";
import type { Type } from "~/models/types.server";
import Button from "~/components/button";

interface TypesListProps {
  types: Type[];
}

export default function TypesList({ types }: TypesListProps) {
  const [markedForDeletion, setMarkedForDeletion] = useState<
    Record<string, boolean>
  >({});

  const markForDeletion = (id: string) => () => {
    setMarkedForDeletion((prev) => ({ ...prev, [id]: true }));
  };

  const handleDelete = async (id: string) => {
    const formData = new FormData();
    formData.append("typeId", id);

    const { data, error } = await actions.deleteType(formData);

    if (error) {
      console.error("Failed to delete type", error);
      return;
    }

    if (data) {
      window.location.reload();
    }
  };

  return (
    <main>
      <a href="/types/new">
        <Button>+ New Type</Button>
      </a>

      <table className="mt-5 min-w-full">
        <thead className="border-b border-gray-300 text-left">
          <tr>
            <th className="pr-2">Name</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {types.map((type) => (
            <tr className="border-b border-gray-300" key={type.id}>
              <td className="pr-2">{type.name}</td>
              <td className="text-right">
                <a href={`/types/${type.id}/edit`} className="inline-block">
                  <Button>Edit</Button>
                </a>
                {!markedForDeletion[type.id] && (
                  <span className="ml-4">
                    <Button isDanger onClick={markForDeletion(type.id)}>
                      X
                    </Button>
                  </span>
                )}
                {markedForDeletion[type.id] && (
                  <span className="ml-4">
                    <Button isDanger onClick={() => handleDelete(type.id)}>
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
