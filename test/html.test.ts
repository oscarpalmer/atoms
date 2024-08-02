import {expect, test} from 'bun:test';
import {html} from '../src/js/html';

test('html + sanitise', () => {
	const original = `<div hidden="hmm" onclick="alert('!')">
	<p href="data:text/html,hmm" src="javascript:console.log" xlink:href="javascript:console.log">Hello</p>
</div>`;

	const expectedNodes = html(original, false);

	expect(expectedNodes.length).toBe(1);
	expect(expectedNodes.join()).toBe(original);

	//

	const sanitised = `<div hidden="">
	<p>Hello</p>
</div>`;

	const sanitisedNodes = html(original);

	expect(sanitisedNodes.length).toBe(1);
	expect(sanitisedNodes.join()).toBe(sanitised);

	//

	const template = document.createElement('template');

	template.id = 'tpl';
	template.innerHTML = '<p>Hello</p>';

	document.append(template);

	const external = html('tpl');

	template.remove();

	expect(external.length).toBe(1);
	expect(external.join()).toBe('<p>Hello</p>');

	//

	expect(html('')).toEqual([]);
});

test('sanitise', () => {});
