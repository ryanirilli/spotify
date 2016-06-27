import React from 'react';
import { renderIntoDocument } from 'react-addons-test-utils';
import { App } from './../src/components/App.jsx!'

function createComponent(props = {}) {
  return renderIntoDocument( <App />);
}

context('App', () => {
  it('should have a unsullied logo img with an alt attribute', () => {
    const props = { /* put all of your mock props here */ };
    const AppComponent = createComponent(props);
    expect(AppComponent.refs.unsulliedLogo.getAttribute('src')).to.equal('/static/img/unsullied-logo.svg');
  })
});