export function defaultScrollToItem(container: HTMLDivElement, item: HTMLDivElement): void {
  const itemHeight = parseInt(getComputedStyle(item).getPropertyValue('height'), 10);

  const containerHeight =
    parseInt(getComputedStyle(container).getPropertyValue('height'), 10) - itemHeight;

  const itemOffsetTop = item.offsetTop;
  const actualScrollTop = container.scrollTop;

  if (itemOffsetTop < actualScrollTop + containerHeight && actualScrollTop < itemOffsetTop) {
    return;
  }

  container.scrollTop = itemOffsetTop;
}

