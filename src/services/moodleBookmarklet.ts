/**
 * CampusFlow Moodle Bookmarklet Generator
 * 
 * Provides a 1-click bookmarklet that can be dragged into the browser bookmarks bar.
 * When clicked on ANY Moodle page (dashboard, course, assignment view), it extracts:
 * - All courses
 * - All experiments / assignments
 * - Submission statuses ("Submitted for grading" vs "No submission")
 * - Deadlines and topics
 * and securely transfers the data directly into CampusFlow!
 */

export function generateBookmarkletCode(campusflowOrigin = window.location.origin): string {
  const script = `
(function() {
  const cfOrigin = "${campusflowOrigin}";
  
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;top:20px;right:20px;z-index:999999;background:#1e1b4b;color:#ffffff;padding:16px 20px;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.3);font-family:sans-serif;max-width:380px;line-height:1.4;border:1px solid #4338ca;';
  toast.innerHTML = '<b style="color:#818cf8;display:block;margin-bottom:6px;">⚡ CampusFlow Moodle Scanner</b>Scanning page for assignments and submission statuses...';
  document.body.appendChild(toast);

  function parseDate(text) {
    if (!text) return new Date().toISOString().split('T')[0];
    const parsed = Date.parse(text);
    if (!isNaN(parsed)) {
      return new Date(parsed).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  }

  function extractExpNum(text, fallback) {
    const m = text.match(/(?:exp(?:eriment)?|lab|practical|assignment)\\s*[:#\\-_]?\\s*0*(\\d+)/i) ||
              text.match(/\\b(?:e|ex)\\s*0*(\\d+)\\b/i) ||
              text.match(/^\\s*0*(\\d+)\\s*[:.\\-_]/);
    return m ? parseInt(m[1], 10) : fallback;
  }

  const experiments = [];
  const courseTitleEl = document.querySelector('.page-header-headings h1') || document.querySelector('h1');
  const courseName = courseTitleEl ? courseTitleEl.innerText.trim() : 'Moodle Course';

  // 1. Scrape standard Moodle assignments table (/mod/assign/index.php)
  const rows = document.querySelectorAll('table.generaltable tbody tr');
  if (rows && rows.length > 0) {
    rows.forEach((row, i) => {
      const link = row.querySelector('td.c1 a, td.c0 a, a[href*="/mod/assign/view.php"]');
      if (!link) return;
      const title = link.innerText.trim();
      const href = link.href;
      
      const dueCell = row.querySelector('td.c2, td[class*="duedate"]');
      const subCell = row.querySelector('td.c3, td[class*="submissionstatus"], td[class*="status"]');
      
      const dueText = dueCell ? dueCell.innerText.trim() : '';
      const subText = subCell ? subCell.innerText.trim().toLowerCase() : '';
      
      const isSubmitted = subText.includes('submitted') || subText.includes('grading') || subText.includes('graded');
      const isGraded = subText.includes('graded') && !subText.includes('not graded');

      experiments.push({
        moodleAssignId: i + 1,
        moodleCmid: i + 1,
        courseId: 1,
        courseName: courseName,
        courseCode: courseName.substring(0, 8).toUpperCase(),
        experimentNumber: extractExpNum(title, i + 1),
        title: title,
        description: 'Imported via CampusFlow Bookmarklet',
        dueDate: parseDate(dueText),
        moodleUrl: href,
        isSubmitted: isSubmitted,
        isGraded: isGraded,
        selected: true
      });
    });
  }

  // 2. Scrape activity links if on course main page
  if (experiments.length === 0) {
    const assignElements = document.querySelectorAll('.activity.assign, li.activity[data-type="assign"], a[href*="/mod/assign/view.php"]');
    assignElements.forEach((el, idx) => {
      const link = el.tagName === 'A' ? el : el.querySelector('a[href*="/mod/assign/view.php"]');
      if (!link) return;
      const title = (el.querySelector('.instancename') || link).innerText.replace(/Assignment/i, '').trim();
      const href = link.href;

      const fullText = el.innerText.toLowerCase();
      const isSubmitted = fullText.includes('submitted') || fullText.includes('done');

      experiments.push({
        moodleAssignId: idx + 1,
        moodleCmid: idx + 1,
        courseId: 1,
        courseName: courseName,
        courseCode: courseName.substring(0, 8).toUpperCase(),
        experimentNumber: extractExpNum(title, idx + 1),
        title: title,
        description: 'Imported via CampusFlow Bookmarklet',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        moodleUrl: href,
        isSubmitted: isSubmitted,
        isGraded: false,
        selected: true
      });
    });
  }

  if (experiments.length === 0) {
    toast.innerHTML = '<b style="color:#ef4444;display:block;margin-bottom:6px;">❌ No assignments found</b>Navigate to your course assignments page (e.g. <i>Assignments</i> link under course activities) and click the bookmarklet again.';
    setTimeout(() => toast.remove(), 7000);
    return;
  }

  const payload = JSON.stringify({
    source: 'moodle_bookmarklet',
    timestamp: Date.now(),
    experiments: experiments
  });

  // Store in localStorage for CampusFlow to read
  try {
    localStorage.setItem('campusflow_moodle_import', payload);
  } catch (e) {}

  toast.innerHTML = \`
    <b style="color:#4ade80;display:block;margin-bottom:6px;">✅ Found \${experiments.length} Experiments!</b>
    <div style="font-size:12px;color:#cbd5e1;margin-bottom:12px;">\${experiments.filter(e => e.isSubmitted).length} submitted, \${experiments.filter(e => !e.isSubmitted).length} pending.</div>
    <div style="display:flex;gap:8px;">
      <button id="cf-open-btn" style="flex:1;background:#6366f1;color:#fff;border:none;padding:8px 12px;border-radius:6px;font-weight:bold;cursor:pointer;font-size:12px;">Open CampusFlow</button>
      <button id="cf-copy-btn" style="background:#334155;color:#fff;border:none;padding:8px 12px;border-radius:6px;font-size:12px;cursor:pointer;">Copy JSON</button>
    </div>
  \`;

  document.getElementById('cf-open-btn').onclick = function() {
    window.open(cfOrigin + '/assignments?moodle_sync=' + encodeURIComponent(JSON.stringify(experiments)), '_blank');
  };

  document.getElementById('cf-copy-btn').onclick = function() {
    navigator.clipboard.writeText(JSON.stringify(experiments, null, 2));
    this.innerText = 'Copied!';
  };
})();
`;

  return `javascript:${encodeURIComponent(script.trim().replace(/\n\s*/g, ''))}`;
}
