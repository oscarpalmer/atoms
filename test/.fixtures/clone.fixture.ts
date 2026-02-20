export class TestCloneItem {
	name: string;

	constructor(
		readonly id: number,
		name: string,
	) {
		this.name = name;
	}

	clone(): TestCloneItem {
		return new TestCloneItem(this.id, 'clone');
	}

	custom(): TestCloneItem {
		return new TestCloneItem(this.id, 'custom');
	}
}
