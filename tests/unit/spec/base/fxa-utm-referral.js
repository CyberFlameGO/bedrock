/* For reference read the Jasmine and Sinon docs
 * Jasmine docs: http://pivotal.github.io/jasmine/
 * Sinon docs: http://sinonjs.org/docs/
 */

/* global sinon */

describe('fxa-utm-referral.js', function() {

    'use strict';

    describe('getHostName', function() {

        it('should return a hostname as expected', function() {
            var url1 = 'https://monitor.firefox.com/oauth/init?form_type=button&entrypoint=mozilla.org-firefox-accounts';
            var url2 = 'https://accounts.firefox.com/?utm_campaign=campaign-one&utm_source=source-one&utm_content=content-one';
            var url3 = 'https://getpocket.com/ff_signup?s=ffwelcome2&form_type=button&entrypoint=mozilla.org-firefox-welcome-2&utm_source=source-one&utm_campaign=campaign-one';

            expect(Mozilla.UtmUrl.getHostName(url1)).toEqual('https://monitor.firefox.com/');
            expect(Mozilla.UtmUrl.getHostName(url2)).toEqual('https://accounts.firefox.com/');
            expect(Mozilla.UtmUrl.getHostName(url3)).toEqual('https://getpocket.com/');
        });

        it('should return null if no match is found', function() {
            var url = 'thedude';
            expect(Mozilla.UtmUrl.getHostName(url)).toBeNull();
        });
    });

    describe('hasUtmParams', function() {
        it('should return true when utm params are present', function() {
            var data = {
                'utm_source': 'vpn-client',
                'utm_content': 'download-first-experiment',
                'utm_medium': 'referral',
                'entrypoint_experiment': 'test-id',
                'entrypoint_variation': 'test-variation'
            };

            expect(Mozilla.UtmUrl.hasUtmParams(data)).toBeTruthy();
        });

        it('should return false when utm params are not present', function() {
            var data = {
                'entrypoint_experiment': 'test-id',
                'entrypoint_variation': 'test-variation'
            };

            expect(Mozilla.UtmUrl.hasUtmParams(data)).toBeFalsy();
        });

        it('should return false when data is not a valid object', function() {
            var data1 = undefined;
            expect(Mozilla.UtmUrl.hasUtmParams(data1)).toBeFalsy();
            var data2 = null;
            expect(Mozilla.UtmUrl.hasUtmParams(data2)).toBeFalsy();
            var data3 = {};
            expect(Mozilla.UtmUrl.hasUtmParams(data3)).toBeFalsy();
        });
    });

    describe('getAttributionData', function () {

        it('should return a valid object unchanged', function () {
            var validObj = {
                'utm_source': 'desktop-snippet',
                'utm_content': 'rel-esr',
                'utm_medium': 'referral',
                'utm_term': 4242,
                'utm_campaign': 'F100_4242_otherstuff_in_here'
            };

            var validData = {
                'utm_source': 'desktop-snippet',
                'utm_content': 'rel-esr',
                'utm_medium': 'referral',
                'utm_term': '4242',
                'utm_campaign': 'F100_4242_otherstuff_in_here'
            };

            expect(Mozilla.UtmUrl.getAttributionData(validObj)).toEqual(validData);
        });

        it('should return a additional entrypoint params if present', function () {
            var validObj = {
                'utm_source': 'desktop-snippet',
                'utm_content': 'rel-esr',
                'utm_medium': 'referral',
                'utm_term': 4242,
                'utm_campaign': 'F100_4242_otherstuff_in_here',
                'entrypoint_experiment': 'test-id',
                'entrypoint_variation': 'test-variation'
            };

            var validData = {
                'utm_source': 'desktop-snippet',
                'utm_content': 'rel-esr',
                'utm_medium': 'referral',
                'utm_term': '4242',
                'utm_campaign': 'F100_4242_otherstuff_in_here',
                'entrypoint_experiment': 'test-id',
                'entrypoint_variation': 'test-variation'
            };

            expect(Mozilla.UtmUrl.getAttributionData(validObj)).toEqual(validData);
        });

        it('should return entrypoint params if not utms are present', function () {
            var validObj = {
                'entrypoint_experiment': 'test-id',
                'entrypoint_variation': 'test-variation'
            };

            var validData = {
                'entrypoint_experiment': 'test-id',
                'entrypoint_variation': 'test-variation'
            };

            expect(Mozilla.UtmUrl.getAttributionData(validObj)).toEqual(validData);
        });

        it('should return FxA flow params if present together with experiment entrypoint params', function() {
            var validObj = {
                'utm_source': 'vpn-client',
                'utm_content': 'download-first-experiment',
                'utm_medium': 'referral',
                'utm_term': 4242,
                'utm_campaign': 'F100_4242_otherstuff_in_here',
                'entrypoint_experiment': 'test-id',
                'entrypoint_variation': 'test-variation',
                'device_id': 123456789,
                'flow_id': 987654321,
                'flow_begin_time': 1234567899
            };

            var validData = {
                'utm_source': 'vpn-client',
                'utm_content': 'download-first-experiment',
                'utm_medium': 'referral',
                'utm_term': '4242',
                'utm_campaign': 'F100_4242_otherstuff_in_here',
                'entrypoint_experiment': 'test-id',
                'entrypoint_variation': 'test-variation',
                'device_id': '123456789',
                'flow_id': '987654321',
                'flow_begin_time': '1234567899'
            };

            expect(Mozilla.UtmUrl.getAttributionData(validObj)).toEqual(validData);
        });

        it('should not return FxA flow params if experiment entrypoint params are also not present', function() {
            var validObj = {
                'utm_source': 'desktop-snippet',
                'utm_content': 'rel-esr',
                'utm_medium': 'referral',
                'utm_term': 4242,
                'utm_campaign': 'F100_4242_otherstuff_in_here',
                'device_id': 123456789,
                'flow_id': 987654321,
                'flow_begin_time': 1234567899
            };

            var validData = {
                'utm_source': 'desktop-snippet',
                'utm_content': 'rel-esr',
                'utm_medium': 'referral',
                'utm_term': '4242',
                'utm_campaign': 'F100_4242_otherstuff_in_here'
            };

            expect(Mozilla.UtmUrl.getAttributionData(validObj)).toEqual(validData);
        });

        it('should return entrypoint and utm params if supported source attribute is present', function() {
            var validObj1 = {
                'source': 'whatsnew88'
            };

            var validData1 = {
                'entrypoint': 'www.mozilla.org-whatsnew',
                'utm_source': 'www.mozilla.org-whatsnew',
                'utm_campaign': 'whatsnew88'
            };

            expect(Mozilla.UtmUrl.getAttributionData(validObj1)).toEqual(validData1);

            var validObj2 = {
                'source': 'welcome9'
            };

            var validData2 = {
                'entrypoint': 'www.mozilla.org-welcome',
                'utm_source': 'www.mozilla.org-welcome',
                'utm_campaign': 'welcome9'
            };

            expect(Mozilla.UtmUrl.getAttributionData(validObj2)).toEqual(validData2);
        });

        it('should return null if source attribute is non-specific', function() {
            var validObj = {
                'source': 'the-dude'
            };

            expect(Mozilla.UtmUrl.getAttributionData(validObj)).toBeNull();
        });

        it('should return an object without any danagerous params', function () {
            var dangerousSource = {
                'utm_source': 'www.mozilla.org',
                'utm_campaign': 'rel-esr',
                'utm_content': '<script>console.log("test");</script>',
            };

            var safeSource = {
                'utm_source': 'www.mozilla.org',
                'utm_campaign': 'rel-esr'
            };

            expect(Mozilla.UtmUrl.getAttributionData(dangerousSource)).toEqual(safeSource);
        });

        it('should not return an object if all params are unsafe', function () {
            var dangerousData = {
                'utm_source': '%5C',
                'utm_content': '%3C',
                'utm_medium': '%24',
                'utm_term': '%40',
                'utm_campaign': '%22'
            };

            expect(Mozilla.UtmUrl.getAttributionData(dangerousData)).toBeNull();
        });

        it('should not return an object if utm_source is missing', function () {
            var data = {
                'utm_content': 'rel-esr',
                'utm_medium': 'referral',
                'utm_term': 4242,
                'utm_campaign': 'F100_4242_otherstuff_in_here'
            };

            expect(Mozilla.UtmUrl.getAttributionData(data)).toBeNull();
        });

        it('should not return an object if utm_campaign is missing', function () {
            var data = {
                'utm_source': 'desktop-snippet',
                'utm_content': 'rel-esr',
                'utm_medium': 'referral',
                'utm_term': 4242,
            };

            expect(Mozilla.UtmUrl.getAttributionData(data)).toBeNull();
        });

        it('should not strip allowed special characters', function () {
            var specialData = {
                'utm_source': 'blog.mozilla.org',
                'utm_campaign': 'my-experiment',
                'utm_medium': '%25',
                'utm_term': '%2F'
            };

            var specialSource = {
                'utm_source': 'blog.mozilla.org',
                'utm_campaign': 'my-experiment',
                'utm_medium': '%',
                'utm_term': '/'
            };

            expect(Mozilla.UtmUrl.getAttributionData(specialData)).toEqual(specialSource);
        });

        it('should decode URL components', function () {
            var encodedData = {
                'utm_source': '%25',
                'utm_campaign': '%2F'
            };

            var encodedSource = {
                'utm_source': '%',
                'utm_campaign': '/'
            };

            expect(Mozilla.UtmUrl.getAttributionData(encodedData)).toEqual(encodedSource);
        });

    });

    describe('appendToDownloadURL', function () {

        it('should append a new query string if there isn\'t one', function () {
            var data = {
                'utm_source': 'desktop-snippet',
                'utm_content': 'rel-esr',
                'utm_medium': 'referral',
                'utm_term': 4242,
                'utm_campaign': 'F100_4242_otherstuff_in_here'
            };

            var url = 'https://accounts.firefox.com/';

            expect(Mozilla.UtmUrl.appendToDownloadURL(url, data)).toEqual('https://accounts.firefox.com/?utm_source=desktop-snippet&utm_content=rel-esr&utm_medium=referral&utm_term=4242&utm_campaign=F100_4242_otherstuff_in_here');
        });

        it('should add UTM params without overwriting other query string params', function () {
            var data = {
                'utm_source': 'test-source'
            };

            var url = 'https://accounts.firefox.com/?spice=pumpkin';

            expect(Mozilla.UtmUrl.appendToDownloadURL(url, data)).toEqual('https://accounts.firefox.com/?spice=pumpkin&utm_source=test-source');
        });

        it('should over-write existing UTM params', function () {
            var data = {
                'utm_source': 'source-two',
                'utm_content': 'content-two',
                'utm_medium': 'medium-two',
                'utm_term': 'term-two',
                'utm_campaign': 'campaign-two'
            };

            var url = 'https://accounts.firefox.com/?utm_medium=medium-one&utm_term=term-one&utm_campaign=campaign-one&utm_source=source-one&utm_content=content-one';

            expect(Mozilla.UtmUrl.appendToDownloadURL(url, data)).toEqual('https://accounts.firefox.com/?utm_source=source-two&utm_content=content-two&utm_medium=medium-two&utm_term=term-two&utm_campaign=campaign-two');
        });

        it('should not leave out new params if there are existing params to over write', function () {
            var data = {
                'utm_source': 'source-two',
                'utm_content': 'content-two',
                'utm_medium': 'medium-two',
                'utm_term': 'term-two',
                'utm_campaign': 'campaign-two'
            };

            var url = 'https://accounts.firefox.com/?utm_campaign=campaign-one&utm_source=source-one&utm_content=content-one';

            expect(Mozilla.UtmUrl.appendToDownloadURL(url, data)).toEqual('https://accounts.firefox.com/?utm_source=source-two&utm_content=content-two&utm_medium=medium-two&utm_term=term-two&utm_campaign=campaign-two');
        });

        it('should remove UTM params that are no longer present in the new referral data', function() {
            var data = {
                'utm_source': 'source-two',
                'utm_campaign': 'campaign-two'
            };

            var url = 'https://accounts.firefox.com/?utm_campaign=campaign-one&utm_source=source-one&utm_content=content-one';

            expect(Mozilla.UtmUrl.appendToDownloadURL(url, data)).toEqual('https://accounts.firefox.com/?utm_source=source-two&utm_campaign=campaign-two');
        });

        it('should not override port, path, or file name', function () {
            var data = {
                'utm_source': 'test-source'
            };

            var url = 'https://accounts.firefox.com:8000/grande/nofat.html?spice=pumpkin';

            expect(Mozilla.UtmUrl.appendToDownloadURL(url, data)).toEqual('https://accounts.firefox.com:8000/grande/nofat.html?spice=pumpkin&utm_source=test-source');
        });

        it('should add additional entrypoint parameters if present', function() {
            var data = {
                'utm_source': 'desktop-snippet',
                'utm_content': 'rel-esr',
                'utm_medium': 'referral',
                'utm_term': 4242,
                'utm_campaign': 'F100_4242_otherstuff_in_here',
                'entrypoint_experiment': 'test-id',
                'entrypoint_variation': 'test-variation'
            };

            var url = 'https://accounts.firefox.com/';

            expect(Mozilla.UtmUrl.appendToDownloadURL(url, data)).toEqual('https://accounts.firefox.com/?utm_source=desktop-snippet&utm_content=rel-esr&utm_medium=referral&utm_term=4242&utm_campaign=F100_4242_otherstuff_in_here&entrypoint_experiment=test-id&entrypoint_variation=test-variation');
        });

        it('should not wipe out existing utms if only enytrpoint params are present', function() {
            var data = {
                'entrypoint_experiment': 'test-id',
                'entrypoint_variation': 'test-variation'
            };

            var url = 'https://accounts.firefox.com/?utm_medium=medium-one&utm_term=term-one&utm_campaign=campaign-one&utm_source=source-one&utm_content=content-one';

            expect(Mozilla.UtmUrl.appendToDownloadURL(url, data)).toEqual('https://accounts.firefox.com/?utm_medium=medium-one&utm_term=term-one&utm_campaign=campaign-one&utm_source=source-one&utm_content=content-one&entrypoint_experiment=test-id&entrypoint_variation=test-variation');
        });

    });

    describe('setFxALinkReferralCookie', function() {

        beforeEach(function () {
            // stub out Mozilla.Cookies lib
            window.Mozilla.Cookies = sinon.stub();
            window.Mozilla.Cookies.enabled = sinon.stub();
            window.Mozilla.Cookies.setItem = sinon.stub();
            window.Mozilla.Cookies.getItem = sinon.stub();
            window.Mozilla.Cookies.hasItem = sinon.stub();
            window.Mozilla.Cookies.removeItem = sinon.stub();
        });

        it('should set a referral cookie as expected', function() {
            spyOn(Mozilla, 'dntEnabled').and.returnValue(false);
            spyOn(Mozilla.Cookies, 'enabled').and.returnValue(true);
            spyOn(Mozilla.Cookies, 'setItem');
            spyOn(Mozilla.UtmUrl, 'hasFxALinkReferralCookie').and.returnValue(false);

            Mozilla.UtmUrl.setFxALinkReferralCookie('navigation');

            expect(Mozilla.Cookies.setItem).toHaveBeenCalledWith('fxa-product-referral-id', 'navigation', jasmine.any(String), '/');
        });

        it('should not set a referral cookie if DNT is enabled', function() {
            spyOn(Mozilla, 'dntEnabled').and.returnValue(true);
            spyOn(Mozilla.Cookies, 'enabled').and.returnValue(true);
            spyOn(Mozilla.Cookies, 'setItem');
            spyOn(Mozilla.UtmUrl, 'hasFxALinkReferralCookie').and.returnValue(false);

            Mozilla.UtmUrl.setFxALinkReferralCookie('navigation');

            expect(Mozilla.Cookies.setItem).not.toHaveBeenCalled();
        });

        it('should not set a referral cookie if one already exists', function() {
            spyOn(Mozilla, 'dntEnabled').and.returnValue(false);
            spyOn(Mozilla.Cookies, 'enabled').and.returnValue(true);
            spyOn(Mozilla.Cookies, 'setItem');
            spyOn(Mozilla.UtmUrl, 'hasFxALinkReferralCookie').and.returnValue(true);

            Mozilla.UtmUrl.setFxALinkReferralCookie('navigation');

            expect(Mozilla.Cookies.setItem).not.toHaveBeenCalled();
        });
    });

    describe('init', function () {

        beforeEach(function () {
            // stub out Mozilla.Cookies lib
            window.Mozilla.Cookies = sinon.stub();
            window.Mozilla.Cookies.enabled = sinon.stub().returns(true);
            window.Mozilla.Cookies.setItem = sinon.stub();
            window.Mozilla.Cookies.getItem = sinon.stub();
            window.Mozilla.Cookies.hasItem = sinon.stub();
            window.Mozilla.Cookies.removeItem = sinon.stub();

            // assume DNT is disabled
            spyOn(Mozilla, 'dntEnabled').and.returnValue(false);

            // link to change
            var links =
                '<div id="test-links">' +
                '<a id="test-expected" class="js-fxa-cta-link" href="https://accounts.firefox.com/?service=sync&amp;action=email&amp;context=fx_desktop_v3&amp;entrypoint=mozilla.org-accounts_page&amp;utm_content=accounts-page-top-cta&amp;utm_source=accounts-page&amp;utm_medium=referral&amp;utm_campaign=fxa-benefits-page" data-mozillaonline-link="https://accounts.firefox.com.cn/?service=sync&amp;action=email&amp;context=fx_desktop_v3&amp;entrypoint=mozilla.org-accounts_page&amp;utm_content=accounts-page-top-cta&amp;utm_source=accounts-page&amp;utm_medium=referral&amp;utm_campaign=fxa-benefits-page">Create a Firefox Account</a>' +
                '<a id="test-not-accounts" class="js-fxa-cta-link" href="https://www.mozilla.org/?service=sync&amp;action=email&amp;context=fx_desktop_v3&amp;entrypoint=mozilla.org-accounts_page&amp;utm_content=accounts-page-top-cta&amp;utm_source=accounts-page&amp;utm_medium=referral&amp;utm_campaign=fxa-benefits-page" data-mozillaonline-link="https://accounts.firefox.com.cn/?service=sync&amp;action=email&amp;context=fx_desktop_v3&amp;entrypoint=mozilla.org-accounts_page&amp;utm_content=accounts-page-top-cta&amp;utm_source=accounts-page&amp;utm_medium=referral&amp;utm_campaign=fxa-benefits-page">Create a Firefox Account</a>' +
                '<a id="test-second-expected" class="js-fxa-cta-link" href="https://monitor.firefox.com/oauth/init?form_type=button&amp;entrypoint=mozilla.org-firefox-accounts&amp;utm_content=accounts-page-top-cta&amp;utm_source=accounts-page&amp;utm_medium=referral&amp;utm_campaign=fxa-benefits-page" data-mozillaonline-link="https://accounts.firefox.com.cn/?service=sync&amp;action=email&amp;context=fx_desktop_v3&amp;entrypoint=mozilla.org-accounts_page&amp;utm_content=accounts-page-top-cta&amp;utm_source=mozilla.org-accounts_page&amp;utm_medium=referral&amp;utm_campaign=fxa-benefits-page">Sign In to Firefox Monitor</a>' +
                '<a id="test-third-expected" class="js-fxa-cta-link" href="https://getpocket.com/ff_signup?s=ffwelcome2&form_type=button&entrypoint=mozilla.org-firefox-welcome-2&utm_source=mozilla.org-firefox-welcome-2&utm_campaign=welcome-2-pocket&utm_medium=referral">Activate Pocket</a>' +
                '</div>';

            document.body.insertAdjacentHTML('beforeend', links);
        });

        afterEach(function () {
            var content = document.getElementById('test-links');
            content.parentNode.removeChild(content);
        });

        it('should update the href of links with class js-fxa-cta-link', function () {
            var data = {
                'utm_source': 'source-two',
                'utm_content': 'content-two',
                'utm_medium': 'medium-two',
                'utm_term': 'term-two',
                'utm_campaign': 'campaign-two'
            };

            Mozilla.UtmUrl.init(data);

            var expected = document.getElementById('test-expected');
            var expectedHref = expected.getAttribute('href');
            var secondExpected = document.getElementById('test-second-expected');
            var secondExpectedHref = secondExpected.getAttribute('href');
            var thirdExpected = document.getElementById('test-third-expected');
            var thirdExpectedHref = thirdExpected.getAttribute('href');

            expect(expectedHref).toEqual('https://accounts.firefox.com/?service=sync&action=email&context=fx_desktop_v3&entrypoint=mozilla.org-accounts_page&utm_source=source-two&utm_campaign=campaign-two&utm_content=content-two&utm_term=term-two&utm_medium=medium-two');
            expect(secondExpectedHref).toEqual('https://monitor.firefox.com/oauth/init?form_type=button&entrypoint=mozilla.org-firefox-accounts&utm_source=source-two&utm_campaign=campaign-two&utm_content=content-two&utm_term=term-two&utm_medium=medium-two');
            expect(thirdExpectedHref).toEqual('https://getpocket.com/ff_signup?s=ffwelcome2&form_type=button&entrypoint=mozilla.org-firefox-welcome-2&utm_source=source-two&utm_campaign=campaign-two&utm_content=content-two&utm_term=term-two&utm_medium=medium-two');
        });

        it('should update the data-mozilla-online attribute of links with class js-fxa-cta-link', function () {
            var data = {
                'utm_source': 'source-two',
                'utm_content': 'content-two',
                'utm_medium': 'medium-two',
                'utm_term': 'term-two',
                'utm_campaign': 'campaign-two'
            };

            Mozilla.UtmUrl.init(data);

            var expected = document.getElementById('test-expected');
            var expectedOnline = expected.getAttribute('data-mozillaonline-link');

            expect(expectedOnline).toEqual('https://accounts.firefox.com.cn/?service=sync&action=email&context=fx_desktop_v3&entrypoint=mozilla.org-accounts_page&utm_source=source-two&utm_campaign=campaign-two&utm_content=content-two&utm_term=term-two&utm_medium=medium-two');
        });

        it('should not make changes if there are no UTM params', function () {
            var data = {};

            Mozilla.UtmUrl.init(data);

            var expected = document.getElementById('test-expected');
            var expectedHref = expected.getAttribute('href');
            var expectedOnline = expected.getAttribute('data-mozillaonline-link');

            expect(expectedHref).toEqual('https://accounts.firefox.com/?service=sync&action=email&context=fx_desktop_v3&entrypoint=mozilla.org-accounts_page&utm_content=accounts-page-top-cta&utm_source=accounts-page&utm_medium=referral&utm_campaign=fxa-benefits-page');
            expect(expectedOnline).toEqual('https://accounts.firefox.com.cn/?service=sync&action=email&context=fx_desktop_v3&entrypoint=mozilla.org-accounts_page&utm_content=accounts-page-top-cta&utm_source=accounts-page&utm_medium=referral&utm_campaign=fxa-benefits-page');
        });

        it('should not make changes if the link is not in the FxA referral allowedList', function () {
            var data = {
                'utm_source': 'source-two',
                'utm_content': 'content-two',
                'utm_medium': 'medium-two',
                'utm_term': 'term-two',
                'utm_campaign': 'campaign-two'
            };

            Mozilla.UtmUrl.init(data);

            var unexpected = document.getElementById('test-not-accounts');
            var unexpectedHref = unexpected.getAttribute('href');
            var unexpectedOnline = unexpected.getAttribute('data-mozillaonline-link');

            expect(unexpectedHref).toEqual('https://www.mozilla.org/?service=sync&action=email&context=fx_desktop_v3&entrypoint=mozilla.org-accounts_page&utm_content=accounts-page-top-cta&utm_source=accounts-page&utm_medium=referral&utm_campaign=fxa-benefits-page');
            expect(unexpectedOnline).toEqual('https://accounts.firefox.com.cn/?service=sync&action=email&context=fx_desktop_v3&entrypoint=mozilla.org-accounts_page&utm_content=accounts-page-top-cta&utm_source=accounts-page&utm_medium=referral&utm_campaign=fxa-benefits-page');
        });

        it('should get referral cookie data if there are no UTM params', function() {
            var data = {};
            spyOn(Mozilla.Cookies, 'getItem').and.returnValue('navigation');
            spyOn(Mozilla.UtmUrl, 'hasFxALinkReferralCookie').and.returnValue(true);

            Mozilla.UtmUrl.init(data);

            var expected = document.getElementById('test-expected');
            var expectedHref = expected.getAttribute('href');
            var expectedOnline = expected.getAttribute('data-mozillaonline-link');

            expect(expectedHref).toEqual('https://accounts.firefox.com/?service=sync&action=email&context=fx_desktop_v3&entrypoint=www.mozilla.org&utm_source=www.mozilla.org&utm_medium=referral&utm_campaign=navigation');
            expect(expectedOnline).toEqual('https://accounts.firefox.com.cn/?service=sync&action=email&context=fx_desktop_v3&entrypoint=www.mozilla.org&utm_source=www.mozilla.org&utm_medium=referral&utm_campaign=navigation');
        });

        it('should set expected values for in-product /whatsnew page referrals', function() {
            var data = {};
            spyOn(Mozilla.Cookies, 'getItem').and.returnValue('whatsnew92');
            spyOn(Mozilla.UtmUrl, 'hasFxALinkReferralCookie').and.returnValue(true);

            Mozilla.UtmUrl.init(data);

            var expected = document.getElementById('test-expected');
            var expectedHref = expected.getAttribute('href');
            var expectedOnline = expected.getAttribute('data-mozillaonline-link');

            expect(expectedHref).toEqual('https://accounts.firefox.com/?service=sync&action=email&context=fx_desktop_v3&entrypoint=www.mozilla.org-whatsnew&utm_source=www.mozilla.org-whatsnew&utm_medium=referral&utm_campaign=whatsnew92');
            expect(expectedOnline).toEqual('https://accounts.firefox.com.cn/?service=sync&action=email&context=fx_desktop_v3&entrypoint=www.mozilla.org-whatsnew&utm_source=www.mozilla.org-whatsnew&utm_medium=referral&utm_campaign=whatsnew92');
        });

        it('should set expected values for in-product /welcome page referrals', function() {
            var data = {};
            spyOn(Mozilla.Cookies, 'getItem').and.returnValue('welcome12');
            spyOn(Mozilla.UtmUrl, 'hasFxALinkReferralCookie').and.returnValue(true);

            Mozilla.UtmUrl.init(data);

            var expected = document.getElementById('test-expected');
            var expectedHref = expected.getAttribute('href');
            var expectedOnline = expected.getAttribute('data-mozillaonline-link');

            expect(expectedHref).toEqual('https://accounts.firefox.com/?service=sync&action=email&context=fx_desktop_v3&entrypoint=www.mozilla.org-welcome&utm_source=www.mozilla.org-welcome&utm_medium=referral&utm_campaign=welcome12');
            expect(expectedOnline).toEqual('https://accounts.firefox.com.cn/?service=sync&action=email&context=fx_desktop_v3&entrypoint=www.mozilla.org-welcome&utm_source=www.mozilla.org-welcome&utm_medium=referral&utm_campaign=welcome12');
        });

        it('should not overwrite other allowed non-UTM params when cookie referral data exists', function() {
            var data = {
                'entrypoint_experiment': 'test-experiment',
                'entrypoint_variation': 'test-variation'
            };
            spyOn(Mozilla.Cookies, 'getItem').and.returnValue('navigation');
            spyOn(Mozilla.UtmUrl, 'hasFxALinkReferralCookie').and.returnValue(true);

            Mozilla.UtmUrl.init(data);

            var expected = document.getElementById('test-expected');
            var expectedHref = expected.getAttribute('href');
            var expectedOnline = expected.getAttribute('data-mozillaonline-link');

            expect(expectedHref).toEqual('https://accounts.firefox.com/?service=sync&action=email&context=fx_desktop_v3&entrypoint=www.mozilla.org&entrypoint_experiment=test-experiment&entrypoint_variation=test-variation&utm_source=www.mozilla.org&utm_medium=referral&utm_campaign=navigation');
            expect(expectedOnline).toEqual('https://accounts.firefox.com.cn/?service=sync&action=email&context=fx_desktop_v3&entrypoint=www.mozilla.org&entrypoint_experiment=test-experiment&entrypoint_variation=test-variation&utm_source=www.mozilla.org&utm_medium=referral&utm_campaign=navigation');
        });
    });
});
