
/**
 * This class implements the data store event domain. All classes extending from 
 * {@link Ext.data.AbstractStore} are included in this domain. The selectors are simply
 * store id's or the wildcard "*" to match any store.
 *
 * @protected
 */

Ext.define('Ext.app.domain.Store', {
    extend: 'Ext.app.EventDomain',
    singleton: true
});
