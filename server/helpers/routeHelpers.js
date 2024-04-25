function isActiveRoute(route,currecntRoute){
    return route === currecntRoute ? 'active' : '';
}

module.exports = {isActiveRoute};