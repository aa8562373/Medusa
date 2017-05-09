import Home from '../views/home.vue'

// This is a factory function for dynamically creating root-level list views,
// since they share most of the logic except for the type of items to display.
// They are essentially higher order components wrapping ItemList.vue.
export function createListView () {
  return {
    //name: `${type}-stories-view`,
    // this will be called during SSR to pre-fetch data into the store!
    preFetch (store) {
      return store.dispatch('FETCH_DATA')
    },
    render (h) {
      return h(Home)
    }
  }
}
