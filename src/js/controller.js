import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

// if(module.hot) {
//   module.hot.accept();
// }

const controllRecipes = async function() {
  try{
    const id = window.location.hash.slice(1);

    if(!id) return;
    recipeView.renderSpinner();

    //  0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultPage());

    //  1) Update Bookmarks View
    bookmarksView.update(model.state.bookmarks);

    //  2) Loading Recipe //////
    await model.loadRecipe(id);
    
    //  3) Rendering Recipe ///
    recipeView.render(model.state.recipe); 

  }catch (err){
    recipeView.renderError();
    console.error(err);
  }
};

const controllSearchResults = async function(){
  try{
    resultsView.renderSpinner();

    // 1) Get Search Query
    const query =  searchView.getQuery();
    if(!query) return;
    
    // 2) Load search results
    await model.loadSearchResult(query);

    // 3) Render Results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultPage());

    // 4) Render initial Pagination  buttons
    paginationView.render(model.state.search);

  }catch(err) {
    console.log(err);
  }
};

const controllPagination = function(goToPage) {
   // 1) Render New Results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultPage(goToPage));

    // 2) Render New Pagination  buttons
    paginationView.render(model.state.search);
};

const controlServings = function(newServings) {
  // Update the Recipe Servings (in state)
  model.updateServings(newServings);

  // Update the Recipe view
  // recipeView.render(model.state.recipe);   
  recipeView.update(model.state.recipe);   
};

const controlAddBookmark = function() {
  // ADD/REMOVE bookmark  
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // UPDATE recipe view
  recipeView.update(model.state.recipe);

  // RENDER bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function() {
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function(newRecipe) {
  try{
    // Show loading Spinner
    addRecipeView.renderSpinner();

// Upload the new recipe Data
await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // RENDER Recipe
    recipeView.render(model.state.recipe);

    // SUCSES Message
    addRecipeView.renderMessage();

    // Render bookmark VIEW
    bookmarksView.render(model.state.bookmarks);

    //Change ID  in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close Form Window
    setTimeout(function() {
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 1000)
 } catch(err) {
  console.error('########', err);
  addRecipeView.renderError(err.message)
 }
};

const init = function() {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controllRecipes);
  recipeView.addHandlerRenderUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark)
  searchView.addHandlerSearch(controllSearchResults);
  paginationView.addHandlerClick(controllPagination);
  addRecipeView._addHandlerUpload(controlAddRecipe);
  console.log('Welcome!');
};
init();
