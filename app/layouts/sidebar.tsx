import { useEffect, useState } from "react";
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useNavigation,
  useSubmit,
} from "react-router";
import { getContacts } from "../data";
import type { Route } from "./+types/sidebar";

function fetchUser() {
  return new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });
}

// 和界面内容强相关的请求放在这里, 比如用户详情界面
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  await fetchUser();
  return { contacts, q };
}

export default function SidebarLayout({ loaderData }: Route.ComponentProps) {
  const { contacts, q } = loaderData;

  const navigation = useNavigation(); // idle loading submitting
  const submit = useSubmit();
  const [query, setQuery] = useState(q || "");

  // 测试 client 是否可以? 是否收接口响应速度的影响？
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  useEffect(() => {
    setQuery(q || "");
  }, [q]);

  return (
    <>
      <div id="sidebar">
        <h1>
          <Link to="about">React Router Contacts</Link>
        </h1>
        <div>
          <Form
            id="search-form"
            role="search"
            onChange={(event) => {
              const isFirstSearch = q === null;
              submit(event.currentTarget, {
                replace: !isFirstSearch,
              });
            }}>
            <input
              aria-label="Search contacts"
              className={
                navigation.state === "loading" && !searching ? "loading" : ""
              }
              value={query}
              id="q"
              name="q"
              placeholder="Search"
              type="search"
              onChange={(event) => {
                setQuery(event.currentTarget.value);
              }}
            />
            <div aria-hidden hidden={!searching} id="search-spinner" />
          </Form>
          <Form method="post">
            <button type="submit">New</button>
          </Form>
        </div>
        <nav>
          {contacts.length ? (
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  {/* 和 to 匹配就高亮 */}
                  <NavLink
                    className={({ isActive, isPending }) =>
                      isActive ? "active" : isPending ? "pending" : ""
                    }
                    to={`contacts/${contact.id}`}>
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                      </>
                    ) : (
                      <i>No Name</i>
                    )}
                    {contact.favorite ? <span>★</span> : null}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <i>No contacts</i>
            </p>
          )}
        </nav>
      </div>

      {/* TODO 测试非 ssr 是否会有效果 */}
      <div
        id="detail"
        className={navigation.state === "loading" ? "loading" : ""}>
        <Outlet />
      </div>
    </>
  );
}
