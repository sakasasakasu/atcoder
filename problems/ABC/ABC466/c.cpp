#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N;
    cin >> N;

    long long ans = 0;
    int i = 1;
    int j = 2;

    while (j <= N) {
        cout << "? " << i << ' ' << j << endl;
        string s;
        cin >> s;
        if (s == "Yes") {
            j++;
        } else {
            ans += (j - 1) - i;
            i++;
            if (i == j) {
                j++;
            }
        }
    }

    while(i <= N) {
        ans += N - i;
        i++;
    }

    cout << "! " << ans << endl;
    return 0;
}

