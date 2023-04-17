import { getSequelizeInstance } from "app";
import { QueryTypes } from "sequelize";

export class MenuItemsService {

  /* TODO: complete getMenuItems so that it returns a nested menu structure
    Requirements:
    - your code should result in EXACTLY one SQL query no matter the nesting level or the amount of menu items.
    - it should work for infinite level of depth (children of childrens children of childrens children, ...)
    - verify your solution with `npm run test`
    - do a `git commit && git push` after you are done or when the time limit is over
    - post process your results in javascript
    Hints:
    - open the `src/menu-items/menu-items.service.ts` file
    - partial or not working answers also get graded so make sure you commit what you have
    Sample response on GET /menu:
    ```json
    [
        {
            "id": 1,
            "name": "All events",
            "url": "/events",
            "parentId": null,
            "createdAt": "2021-04-27T15:35:15.000000Z",
            "children": [
                {
                    "id": 2,
                    "name": "Laracon",
                    "url": "/events/laracon",
                    "parentId": 1,
                    "createdAt": "2021-04-27T15:35:15.000000Z",
                    "children": [
                        {
                            "id": 3,
                            "name": "Illuminate your knowledge of the laravel code base",
                            "url": "/events/laracon/workshops/illuminate",
                            "parentId": 2,
                            "createdAt": "2021-04-27T15:35:15.000000Z",
                            "children": []
                        },
                        {
                            "id": 4,
                            "name": "The new Eloquent - load more with less",
                            "url": "/events/laracon/workshops/eloquent",
                            "parentId": 2,
                            "createdAt": "2021-04-27T15:35:15.000000Z",
                            "children": []
                        }
                    ]
                },
                {
                    "id": 5,
                    "name": "Reactcon",
                    "url": "/events/reactcon",
                    "parentId": 1,
                    "createdAt": "2021-04-27T15:35:15.000000Z",
                    "children": [
                        {
                            "id": 6,
                            "name": "#NoClass pure functional programming",
                            "url": "/events/reactcon/workshops/noclass",
                            "parentId": 5,
                            "createdAt": "2021-04-27T15:35:15.000000Z",
                            "children": []
                        },
                        {
                            "id": 7,
                            "name": "Navigating the function jungle",
                            "url": "/events/reactcon/workshops/jungle",
                            "parentId": 5,
                            "createdAt": "2021-04-27T15:35:15.000000Z",
                            "children": []
                        }
                    ]
                }
            ]
        }
    ]
  */

    async getMenuItems() {
        const rawQuery = `
          WITH RECURSIVE menu_items_recursive AS (
            SELECT 
              id,
              name,
              url,
              parent_id,
              created_at,
              1 as level,
              ARRAY[id] as path,
              ARRAY[name] as path_name
            FROM 
              menu_items
            WHERE 
              parent_id IS NULL
            
            UNION ALL
            
            SELECT 
              mi.id,
              mi.name,
              mi.url,
              mi.parent_id,
              mi.created_at,
              mir.level + 1,
              path || mi.id,
              path_name || mi.name
            FROM 
              menu_items mi
            INNER JOIN 
              menu_items_recursive mir ON mir.id = mi.parent_id
          )
          SELECT 
            id, 
            name, 
            url, 
            parent_id,
            created_at,
            level,
            path,
            path_name
          FROM 
            menu_items_recursive
          ORDER BY 
            path
        `;
        const menuItems: any = await getSequelizeInstance().query(rawQuery, { type: QueryTypes.SELECT });
      
        const nestedMenuItems: any[] = [];
      
        // Creating an object to map menu item ids to their objects
        const menuItemMap: any = {};
        menuItems.forEach((menuItem: any) => {
          menuItem.children = [];
          menuItemMap[menuItem.id] = menuItem;
        });
      
        // Iterating over menu items and add them to their parent's children array
        menuItems.forEach((menuItem: any) => {
          if (menuItem.parent_id) {
            const parentMenuItem = menuItemMap[menuItem.parent_id];
            parentMenuItem.children.push(menuItem);
          } else {
            nestedMenuItems.push(menuItem);
          }
        });
      
        return nestedMenuItems;
      }
      
}
