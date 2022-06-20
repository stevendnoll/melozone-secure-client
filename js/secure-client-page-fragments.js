const headerMenu = (sc = null) => {
    const menuItems = [
        {
            href: 'home',
            label: 'Home',
            title: 'Home',
        },
        {
            href: 'create',
            label: 'Create',
            title: 'Create Message',
        },
        {
            href: 'read',
            label: 'Read',
            title: 'Read Message',
        },
    ];
    clearInnerHTML(sc.dom.nodes.headerMenu);
    menuItems.forEach((menuItem) => {
        let itemLink = '';
        if (menuItem.href !== sc.state.page) {
            itemLink = `<a href="#${ menuItem.href }" title="${ menuItem.title }" class="menu-link" data-menu-link="${ menuItem.href }">${ menuItem.label }</a>`;
        } else {
            itemLink = `<a href="#${ menuItem.href }" title="${ menuItem.title }" class="menu-link link-selected" data-menu-link="${ menuItem.href }">${ menuItem.label }</a>`;
        }
        printStr(sc.dom.nodes.headerMenu, itemLink, false);
    });
};