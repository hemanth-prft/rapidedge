import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Block variant 'small' = small card type; default is 'large'
  const cardType = block.classList.contains('small') ? 'small' : 'large';

  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.classList.add('quick-facts-item', `quick-facts-${cardType}`);
    moveInstrumentation(row, li);

    const cols = [...row.children];
    let eyeBrow = null;
    let statistic = null;
    let subtext = null;

    if (cols.length >= 3) {
      // 3 columns: eyeBrow | statistic | subtext
      [eyeBrow, statistic, subtext] = cols;
    } else if (cols.length === 2) {
      // 2 columns: statistic | subtext
      [statistic, subtext] = cols;
    } else {
      [statistic] = cols;
    }

    if (eyeBrow) {
      eyeBrow.className = 'quick-facts-eye-brow';
      li.append(eyeBrow);
    }

    if (statistic) {
      statistic.className = 'quick-facts-statistic';
      li.append(statistic);
    }

    const hr = document.createElement('hr');
    hr.className = 'quick-facts-border';
    li.append(hr);

    if (subtext) {
      subtext.className = 'quick-facts-subtext';
      li.append(subtext);
    }

    ul.append(li);
  });

  block.replaceChildren(ul);
}
