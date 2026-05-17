#include <bits/stdc++.h>
#define rep(i,n) for (int i=0; i<(n); i++)
using namespace std;

int main() {
    int H, W;
    cin >> H >> W;

    if (H == 1 && W == 1) {
        cout << 0 << endl;
        return 0;
    }

    if (H == 1) {
        for (int i = 0; i < W; i++) {
            if (i == 0 || i == W - 1) {
                cout << 1;
            } else {
                cout << 2;
            }
            if (i != W - 1) {
                cout << " ";
            }
        }
        return 0;
    }

    if (W == 1) {
        for (int i = 0; i < H; i++) {
            if (i == 0 || i == H - 1) {
                cout << 1 << endl;
            } else {
                cout << 2 << endl;
            }
        }
        return 0;
    }

    for (int i = 0; i < H; i++) {
        for (int j = 0; j < W; j++) {
            if (i == 0 && j == 0 || i == H - 1 && j == W - 1 || i == 0 && j == W - 1 || i == H - 1 && j == 0) {
                cout << 2;
            } else if (i == 0 || i == H - 1 || j == 0 || j == W - 1) {
                cout << 3;
            } else {
                cout << 4;
            }
            if (j != W - 1) {
                cout << " ";
            }
        }
        cout << endl;
    }
}
