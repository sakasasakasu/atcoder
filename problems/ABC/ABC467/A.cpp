#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int H, W;
    cin >> H >> W;
    cout << (W * 10000 >= 25 * H * H ? "Yes" : "No") << endl;
}
