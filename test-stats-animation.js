// Quick test to verify stats animations work on initial page load
// This tests the fix for stats not animating when they don't get split up

console.log('Testing stats animation fix...');

// Wait for page to load
window.addEventListener('load', () => {
  setTimeout(() => {
    // Find donut charts
    const donutCharts = document.querySelectorAll('.stat-donut-chart .circle');
    console.log(`Found ${donutCharts.length} donut charts`);

    // Check if they have non-zero stroke-dasharray (indicating animation occurred)
    let animatedCount = 0;
    donutCharts.forEach((circle, index) => {
      const strokeDashArray = circle.getAttribute('stroke-dasharray');
      console.log(`Chart ${index}: stroke-dasharray = "${strokeDashArray}"`);

      if (strokeDashArray && strokeDashArray !== '0, 100') {
        animatedCount++;
      }
    });

    console.log(
      `${animatedCount} out of ${donutCharts.length} donut charts have animated`
    );

    if (animatedCount > 0) {
      console.log('✅ SUCCESS: Stats animations are working!');
    } else {
      console.log('❌ FAILURE: No stats animations detected');
    }
  }, 3000); // Wait 3 seconds for animations to complete
});
