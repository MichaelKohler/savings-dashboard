import { useState } from "react";
import { actions } from "astro:actions";
import Button from "~/components/button";
import Swatch from "~/components/swatch";

interface AccountWithRelations {
  id: string;
  name: string;
  color: string;
  archived: boolean;
  showInGraphs: boolean;
  group?: {
    id: string;
    name: string;
  } | null;
  type?: {
    id: string;
    name: string;
  } | null;
}

interface AccountsListProps {
  activeAccounts: AccountWithRelations[];
  archivedAccounts: AccountWithRelations[];
}

export default function AccountsList({
  activeAccounts,
  archivedAccounts,
}: AccountsListProps) {
  const [markedForDeletion, setMarkedForDeletion] = useState<
    Record<string, boolean>
  >({});

  const markForDeletion = (id: string) => () => {
    setMarkedForDeletion((prev) => ({ ...prev, [id]: true }));
  };

  const handleDelete = async (id: string) => {
    const formData = new FormData();
    formData.append("accountId", id);

    const { data, error } = await actions.deleteAccount(formData);

    if (error) {
      console.error("Failed to delete account", error);
      return;
    }

    if (data) {
      window.location.reload();
    }
  };

  return (
    <main>
      <a href="/accounts/new">
        <Button>+ New Account</Button>
      </a>

      <h2 className="mb-4 mt-8 text-xl font-semibold">Active Accounts</h2>
      <table className="min-w-full">
        <thead className="border-b border-gray-300 text-left">
          <tr>
            <th className="w-10 pr-2"></th>
            <th className="pr-2">Name</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {activeAccounts.map((account) => {
            return (
              <tr className="border-b border-gray-300" key={account.id}>
                <td className="w-10 pr-2">
                  <Swatch color={account.color} />
                </td>
                <td className="pr-2">
                  <span className="block">
                    {account.name}
                    {account.group?.name ? ` (${account.group.name})` : ""}
                  </span>
                  {account.type?.name ? (
                    <span className="block text-sm text-gray-400">
                      {account.type?.name}
                    </span>
                  ) : null}
                </td>
                <td className="text-right text-black">
                  <a
                    href={`/accounts/${account.id}/edit`}
                    className="inline-block"
                  >
                    <Button>Edit</Button>
                  </a>
                  {!markedForDeletion[account.id] && (
                    <span className="ml-4">
                      <Button isDanger onClick={markForDeletion(account.id)}>
                        X
                      </Button>
                    </span>
                  )}
                  {markedForDeletion[account.id] && (
                    <span className="ml-4">
                      <Button isDanger onClick={() => handleDelete(account.id)}>
                        X?
                      </Button>
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {archivedAccounts.length > 0 && (
        <>
          <h2 className="mb-4 mt-8 text-xl font-semibold text-gray-400">
            Archived Accounts
          </h2>
          <table className="min-w-full">
            <thead className="border-b border-gray-300 text-left">
              <tr>
                <th className="w-10 pr-2"></th>
                <th className="pr-2">Name</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {archivedAccounts.map((account) => {
                return (
                  <tr
                    className="border-b border-gray-300 text-gray-300"
                    key={account.id}
                  >
                    <td className="w-10 pr-2">
                      <Swatch color={account.color} />
                    </td>
                    <td className="pr-2">
                      <span className="block">
                        {account.name}
                        {account.group?.name ? ` (${account.group.name})` : ""}
                      </span>
                      {account.type?.name ? (
                        <span className="block text-sm text-gray-400">
                          {account.type?.name}
                        </span>
                      ) : null}
                    </td>
                    <td className="text-right text-black">
                      <a
                        href={`/accounts/${account.id}/edit`}
                        className="inline-block"
                      >
                        <Button>Edit</Button>
                      </a>
                      {!markedForDeletion[account.id] && (
                        <span className="ml-4">
                          <Button
                            isDanger
                            onClick={markForDeletion(account.id)}
                          >
                            X
                          </Button>
                        </span>
                      )}
                      {markedForDeletion[account.id] && (
                        <span className="ml-4">
                          <Button
                            isDanger
                            onClick={() => handleDelete(account.id)}
                          >
                            X?
                          </Button>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}
