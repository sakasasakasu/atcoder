#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int T;
    cin >> T;

    while (T--) {
        int X1, Y1, R1, X2, Y2, R2;
        cin >> X1, Y1, R1, X2, Y2, R2;
        
        int a = pow(X1 - X2, 2);
        int b = pow(Y1 - Y2, 2);
        int c = a + b;

        bool ans = R1 - R2 <= c && c <= R1 + R2;

        cout << (ans ? "Yes" : "No");
    }
}
