export function titleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join('');
}

export function formatTimeAgo(t) {
  const diff = (Date.now() - t) / 1000;

  const MINUTE = 60;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  function f(seconds, unit) {
    let val = Math.floor(diff / seconds);
    return `${val} ${unit}${val > 1 ? 's' : ''} ago`;
  }

  if (diff >= DAY) {
    return f(DAY, 'day');
  }
  if (diff >= HOUR) {
    return f(HOUR, 'hour');
  }
  if (diff >= MINUTE) {
    return f(MINUTE, 'minute');
  }
  return `just now`;
}

export function isBrowser() {
  return typeof window !== 'undefined';
}

export function isPopup() {
  function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
      var sParameterName = sURLVariables[i].split('=');
      if (sParameterName[0] == sParam) {
        return sParameterName[1];
      }
    }
    return null;
  }
  return isBrowser() && getUrlParameter('popup') !== null;
}
