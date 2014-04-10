/*
This file is part of Ext JS 4.2

Copyright (c) 2011-2013 Sencha Inc

Contact:  http://www.sencha.com/contact

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance with the Commercial
Software License Agreement provided with the Software or, alternatively, in accordance with the
terms contained in a written agreement between you and Sencha.

If you are unsure which license is appropriate for your use, please contact the sales department
at http://www.sencha.com/contact.

Build date: 2013-03-11 22:33:40 (aed16176e68b5e8aa1433452b12805c0ad913836)
*/
/**
 * Controllers are the glue that binds an application together. All they really do is listen for events (usually from
 * views) and take some action. Here's how we might create a Controller to manage Users:
 *
 *      Ext.define('MyApp.controller.Users', {
 *          extend: 'Ext.app.Controller',
 *
 *          init: function() {
 *              console.log('Initialized Users! This happens before ' +
 *                          'the Application launch() function is called');
 *          }
 *      });
 *
 * The init function is a special method that is called when your application boots. It is called before the
 * {@link Ext.app.Application Application}'s launch function is executed so gives a hook point to run any code before
 * your Viewport is created.
 *
 * The init function is a great place to set up how your controller interacts with the view, and is usually used in
 * conjunction with another Controller function - {@link Ext.app.Controller#control control}. The control function
 * makes it easy to listen to events on your view classes and take some action with a handler function. Let's update
 * our Users controller to tell us when the panel is rendered:
 *
 *      Ext.define('MyApp.controller.Users', {
 *          extend: 'Ext.app.Controller',
 *
 *          init: function() {
 *              this.control({
 *                  'viewport > panel': {
 *                      render: this.onPanelRendered
 *                  }
 *              });
 *          },
 *
 *          onPanelRendered: function() {
 *              console.log('The panel was rendered');
 *          }
 *      });
 *
 * We've updated the init function to use {@link Ext.app.Controller#control control method} to set up listeners on views
 * in our application. The control method uses the ComponentQuery engine to quickly and easily get references to components
 * on the page. If you are not familiar with ComponentQuery yet, be sure to check out the
 * {@link Ext.ComponentQuery documentation}. In brief though, it allows us to pass a CSS-like selector that will find
 * every matching component on the page.
 *
 * In our init function above we supplied 'viewport > panel', which translates to "find me every Panel that is a direct
 * child of a Viewport". We then supplied an object that maps event names (just 'render' in this case) to handler
 * functions. The overall effect is that whenever any component that matches our selector fires a 'render' event, our
 * onPanelRendered function is called.
 *
 * ## Event domains
 *
 * In Ext JS 4.2, we introduced the concept of event domains. In terms of MVC, an event domain
 * is one or more base classes that fire events to which a Controller wants to listen. Besides
 * Component event domain that encompass {@link Ext.Component}-descended Views, Controllers now
 * can listen to events from data Stores, Ext.Direct Providers, other Controllers, and Ext.globalEvents.
 * This feature provides a way to communicate between parts of the whole application without the need
 * to bind controllers together tightly, and allows to develop and test application parts in isolation.
 *
 * See usage examples in {@link #listen} method documentation.
 *
 * ## Using refs
 *
 * One of the most useful parts of Controllers is the ref system. These use the {@link Ext.ComponentQuery} to
 * make it really easy to get references to Views on your page. Let's look at an example of this now:
 *
 *      Ext.define('MyApp.controller.Users', {
 *          extend: 'Ext.app.Controller',
 *          
 *          refs: [{
 *              ref: 'list',
 *              selector: 'grid'
 *          }],
 *          
 *          init: function() {
 *              this.control({
 *                  'button': {
 *                      click: this.refreshGrid
 *                  }
 *              });
 *          },
 *          
 *          refreshGrid: function() {
 *              this.getList().store.load();
 *          }
 *      });
 *
 * This example assumes the existence of a {@link Ext.grid.Panel Grid} on the page, which contains a single button to
 * refresh the Grid when clicked. In our refs array, we set up a reference to the grid. There are two parts to this -
 * the 'selector', which is a {@link Ext.ComponentQuery ComponentQuery} selector which finds any grid on the page and
 * assigns it to the reference 'list'.
 *
 * By giving the reference a name, we get a number of things for free. The first is the getList function that we use in
 * the refreshGrid method above. This is generated automatically by the Controller based on the name of our ref, which
 * was capitalized and prepended with get to go from 'list' to 'getList'.
 *
 * The way this works is that the first time getList is called by your code, the ComponentQuery selector is run and the
 * first component that matches the selector ('grid' in this case) will be returned. All future calls to getList will
 * use a cached reference to that grid. Usually it is advised to use a specific ComponentQuery selector that will only
 * match a single View in your application (in the case above our selector will match any grid on the page).
 *
 * Bringing it all together, our init function is called when the application boots, at which time we call this.control
 * to listen to any click on a {@link Ext.button.Button button} and call our refreshGrid function (again, this will
 * match any button on the page so we advise a more specific selector than just 'button', but have left it this way for
 * simplicity). When the button is clicked we use out getList function to refresh the grid.
 *
 * You can create any number of refs and control any number of components this way, simply adding more functions to
 * your Controller as you go. For an example of real-world usage of Controllers see the Feed Viewer example in the
 * examples/app/feed-viewer folder in the SDK download.
 *
 * ## Generated getter methods
 *
 * Refs aren't the only thing that generate convenient getter methods. Controllers often have to deal with Models and
 * Stores so the framework offers a couple of easy ways to get access to those too. Let's look at another example:
 *
 *      Ext.define('MyApp.controller.Users', {
 *          extend: 'Ext.app.Controller',
 *
 *          models: ['User'],
 *          stores: ['AllUsers', 'AdminUsers'],
 *
 *          init: function() {
 *              var User, allUsers, ed;
 *              
 *              User = this.getUserModel();
 *              allUsers = this.getAllUsersStore();
 *
 *              ed = new User({ name: 'Ed' });
 *              allUsers.add(ed);
 *          }
 *      });
 *
 * By specifying Models and Stores that the Controller cares about, it again dynamically loads them from the appropriate
 * locations (app/model/User.js, app/store/AllUsers.js and app/store/AdminUsers.js in this case) and creates getter
 * functions for them all. The example above will create a new User model instance and add it to the AllUsers Store.
 * Of course, you could do anything in this function but in this case we just did something simple to demonstrate the
 * functionality.
 *
 * ## Further Reading
 *
 * For more information about writing Ext JS 4 applications, please see the
 * [application architecture guide](#/guide/application_architecture). Also see the {@link Ext.app.Application}
 * documentation.
 *
 * @docauthor Ed Spencer
 */
Ext.define('Ext.app.Controller', {
    requires: [
        'Ext.app.domain.Global',
        'Ext.app.domain.Component',
        'Ext.app.domain.Store'
    ]
});
